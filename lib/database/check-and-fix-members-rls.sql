-- =============================================
-- CHECK AND FIX: Members Table RLS Policy
-- =============================================
-- This script checks the current state and fixes the RLS policy issue
-- Run this in Supabase SQL Editor

-- =============================================
-- STEP 1: Check current user and role
-- =============================================
SELECT 
    'Current User Check' as step,
    auth.uid() as user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email,
    (SELECT role FROM public.profiles WHERE id = auth.uid()) as user_role,
    public.is_admin(auth.uid()) as is_admin_result;

-- =============================================
-- STEP 2: Check if is_admin function exists
-- =============================================
SELECT 
    'Function Check' as step,
    EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'is_admin'
    ) as is_admin_function_exists;

-- =============================================
-- STEP 3: Check current policies
-- =============================================
SELECT 
    'Current Policies' as step,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'members'
ORDER BY policyname;

-- =============================================
-- STEP 4: Fix - Drop all existing policies
-- =============================================
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;
DROP POLICY IF EXISTS "Admins can update members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;
DROP POLICY IF EXISTS "Coaches can view their group members" ON public.members;

-- =============================================
-- STEP 5: Ensure is_admin function exists
-- =============================================
-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- =============================================
-- STEP 6: Create new policies with proper WITH CHECK
-- =============================================

-- SELECT - anyone can view
CREATE POLICY "Anyone can view members" ON public.members
    FOR SELECT 
    USING (true);

-- INSERT - admins can insert (WITH CHECK is CRITICAL for INSERT)
CREATE POLICY "Admins can insert members" ON public.members
    FOR INSERT 
    WITH CHECK (
        public.is_admin(auth.uid()) = true
    );

-- UPDATE - admins can update
CREATE POLICY "Admins can update members" ON public.members
    FOR UPDATE 
    USING (public.is_admin(auth.uid()) = true)
    WITH CHECK (public.is_admin(auth.uid()) = true);

-- DELETE - admins can delete
CREATE POLICY "Admins can delete members" ON public.members
    FOR DELETE 
    USING (public.is_admin(auth.uid()) = true);

-- Coaches can view their group members
CREATE POLICY "Coaches can view their group members" ON public.members
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE groups.id = members.group_id 
            AND groups.coach_id = auth.uid()
        )
    );

-- =============================================
-- STEP 7: Verify policies were created
-- =============================================
SELECT 
    'Verification' as step,
    policyname,
    cmd,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No WITH CHECK'
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'members'
ORDER BY policyname;

-- =============================================
-- STEP 8: Test INSERT permission
-- =============================================
-- This will show if the current user can insert
SELECT 
    'Permission Test' as step,
    auth.uid() as user_id,
    public.is_admin(auth.uid()) as can_insert,
    CASE 
        WHEN public.is_admin(auth.uid()) = true THEN '✅ Can insert members'
        ELSE '❌ Cannot insert - User is not admin. Update profiles table: UPDATE public.profiles SET role = ''admin'' WHERE id = auth.uid();'
    END as status;

-- =============================================
-- IMPORTANT: If the test shows you cannot insert,
-- run this to set your role to admin:
-- =============================================
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = auth.uid();
--
-- If you don't have a profile record, create one:
-- INSERT INTO public.profiles (id, email, role, full_name)
-- VALUES (auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), 'admin', 'Admin User')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

