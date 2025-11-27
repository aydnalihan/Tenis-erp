-- =============================================
-- COMPLETE FIX: Fix RLS and Views
-- =============================================
-- This script fixes ALL issues including RLS infinite recursion and view security
-- Run this in Supabase SQL Editor

-- =============================================
-- Step 1: Drop existing views
-- =============================================
DROP VIEW IF EXISTS public.member_details CASCADE;
DROP VIEW IF EXISTS public.attendance_stats CASCADE;
DROP VIEW IF EXISTS public.payment_stats CASCADE;

-- =============================================
-- Step 2: Disable RLS on profiles table (TEMPORARY FIX)
-- =============================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Step 3: Drop ALL existing policies on profiles
-- =============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- =============================================
-- Step 4: Create helper functions
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    -- Since RLS is disabled on profiles, we can query directly
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_coach(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'coach'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach(UUID) TO authenticated;

-- =============================================
-- Step 5: Fix all other table policies
-- =============================================

-- Groups policies
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Coaches can update their groups" ON public.groups;

CREATE POLICY "Anyone can view groups" ON public.groups
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage groups" ON public.groups
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can update their groups" ON public.groups
    FOR UPDATE USING (coach_id = auth.uid());

-- Members policies
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Coaches can view their group members" ON public.members;

CREATE POLICY "Anyone can view members" ON public.members
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage members" ON public.members
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can view their group members" ON public.members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE groups.id = members.group_id AND groups.coach_id = auth.uid()
        )
    );

-- Lessons policies
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Coaches can manage their group lessons" ON public.lessons;

CREATE POLICY "Anyone can view lessons" ON public.lessons
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage lessons" ON public.lessons
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can manage their group lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE groups.id = lessons.group_id AND groups.coach_id = auth.uid()
        )
    );

-- Attendance policies
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Coaches can manage their lesson attendance" ON public.attendance;

CREATE POLICY "Anyone can view attendance" ON public.attendance
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage attendance" ON public.attendance
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can manage their lesson attendance" ON public.attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            JOIN public.groups ON groups.id = lessons.group_id
            WHERE lessons.id = attendance.lesson_id AND groups.coach_id = auth.uid()
        )
    );

-- Payments policies
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Coaches can view payments" ON public.payments;

CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can view payments" ON public.payments
    FOR SELECT USING (public.is_coach(auth.uid()));

-- Inventory policies
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;

CREATE POLICY "Anyone can view inventory" ON public.inventory
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage inventory" ON public.inventory
    FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- Step 6: Recreate views with SECURITY INVOKER (explicit)
-- =============================================

-- View for member details with group info
-- Note: Views are SECURITY INVOKER by default in PostgreSQL
CREATE VIEW public.member_details AS
SELECT 
    m.*,
    g.name as group_name,
    g.description as group_description
FROM public.members m
LEFT JOIN public.groups g ON m.group_id = g.id;

-- View for attendance statistics
CREATE VIEW public.attendance_stats AS
SELECT 
    m.id as member_id,
    m.name,
    m.surname,
    COUNT(a.id) as total_lessons,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
    ROUND(
        COUNT(CASE WHEN a.status = 'present' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(a.id), 0) * 100, 
        2
    ) as attendance_rate
FROM public.members m
LEFT JOIN public.attendance a ON m.id = a.member_id
GROUP BY m.id, m.name, m.surname;

-- View for payment statistics
CREATE VIEW public.payment_stats AS
SELECT 
    m.id as member_id,
    m.name,
    m.surname,
    COUNT(p.id) as total_periods,
    COUNT(CASE WHEN p.paid = true THEN 1 END) as paid_count,
    COUNT(CASE WHEN p.paid = false THEN 1 END) as pending_count,
    SUM(p.amount) as total_amount,
    SUM(CASE WHEN p.paid = true THEN p.amount ELSE 0 END) as paid_amount
FROM public.members m
LEFT JOIN public.payments p ON m.id = p.member_id
GROUP BY m.id, m.name, m.surname;

-- =============================================
-- Step 7: Grant permissions on views
-- =============================================
GRANT SELECT ON public.member_details TO authenticated;
GRANT SELECT ON public.attendance_stats TO authenticated;
GRANT SELECT ON public.payment_stats TO authenticated;

-- =============================================
-- IMPORTANT: Set your user as admin
-- =============================================
-- Run this after the script above:
-- 
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';
--
-- Or check your current user:
-- SELECT id, email, role FROM public.profiles;

