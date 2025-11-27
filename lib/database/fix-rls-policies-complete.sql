-- =============================================
-- Complete RLS Policy Fix - Remove All Infinite Recursion
-- =============================================
-- This script completely fixes all RLS policies to prevent infinite recursion
-- Run this in Supabase SQL Editor

-- =============================================
-- Step 1: Drop ALL existing policies
-- =============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Groups policies
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Coaches can update their groups" ON public.groups;

-- Members policies
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Coaches can view their group members" ON public.members;

-- Lessons policies
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Coaches can manage their group lessons" ON public.lessons;

-- Attendance policies
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Coaches can manage their lesson attendance" ON public.attendance;

-- Payments policies
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Coaches can view payments" ON public.payments;

-- Inventory policies
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;

-- =============================================
-- Step 2: Create helper functions
-- =============================================

-- Function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- Function to check if user is coach (bypasses RLS)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach(UUID) TO authenticated;

-- =============================================
-- Step 3: Recreate all policies with helper functions
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Groups policies
CREATE POLICY "Anyone can view groups" ON public.groups
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage groups" ON public.groups
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can update their groups" ON public.groups
    FOR UPDATE USING (coach_id = auth.uid());

-- Members policies
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
CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can view payments" ON public.payments
    FOR SELECT USING (public.is_coach(auth.uid()));

-- Inventory policies
CREATE POLICY "Anyone can view inventory" ON public.inventory
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage inventory" ON public.inventory
    FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- Step 4: Verify and set admin user
-- =============================================
-- After running this script, set your user as admin:
-- 
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';
--
-- Or check current users:
-- SELECT id, email, role FROM public.profiles;

