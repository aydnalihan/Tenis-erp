-- =============================================
-- EMERGENCY FIX: Disable RLS on profiles temporarily
-- =============================================
-- This is a temporary fix to stop the infinite recursion
-- Run this FIRST in Supabase SQL Editor

-- Step 1: Disable RLS on profiles table temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Step 3: Create helper function (if not exists)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    -- Since RLS is disabled, we can query directly
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

-- Step 4: Update all other policies to use helper functions
-- Drop and recreate groups policies
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Coaches can update their groups" ON public.groups;

CREATE POLICY "Anyone can view groups" ON public.groups
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage groups" ON public.groups
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can update their groups" ON public.groups
    FOR UPDATE USING (coach_id = auth.uid());

-- Drop and recreate members policies
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

-- Drop and recreate lessons policies
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

-- Drop and recreate attendance policies
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

-- Drop and recreate payments policies
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Coaches can view payments" ON public.payments;

CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can view payments" ON public.payments
    FOR SELECT USING (public.is_coach(auth.uid()));

-- Drop and recreate inventory policies
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;

CREATE POLICY "Anyone can view inventory" ON public.inventory
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage inventory" ON public.inventory
    FOR ALL USING (public.is_admin(auth.uid()));

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

