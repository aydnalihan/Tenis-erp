-- =============================================
-- Check Members Table Policies
-- =============================================
-- Run this to see current policies

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'members';

-- Check all policies on members
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'members'
ORDER BY policyname;

-- Check if is_admin function exists and works
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';

-- Test is_admin function with current user
SELECT 
    auth.uid() as current_user_id,
    public.is_admin(auth.uid()) as is_admin_result;

-- Check current user's profile
SELECT 
    id,
    email,
    role,
    full_name
FROM public.profiles
WHERE id = auth.uid();

