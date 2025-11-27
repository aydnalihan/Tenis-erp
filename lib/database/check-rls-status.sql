-- =============================================
-- Check RLS Status and Policies
-- =============================================
-- Run this in Supabase SQL Editor to check current status

-- Check if RLS is enabled on profiles
SELECT 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED - This may cause infinite recursion!'
        ELSE 'RLS DISABLED - Good!'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check all policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as policy_condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if helper functions exist
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'is_coach');

-- Check current user profile
SELECT 
    id,
    email,
    role,
    full_name
FROM public.profiles
WHERE id = auth.uid();

-- Check all profiles (should work if RLS is disabled)
SELECT 
    id,
    email,
    role,
    full_name
FROM public.profiles
LIMIT 5;

