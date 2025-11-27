-- =============================================
-- Fix RLS Policies - Remove Infinite Recursion
-- =============================================
-- This script fixes the infinite recursion issue in profiles table policies
-- Run this in Supabase SQL Editor

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a security definer function to check if user is admin
-- This bypasses RLS and prevents infinite recursion
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

-- Recreate profiles policies without recursion
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Now update all other policies to use the helper function
-- Drop existing policies that check profiles
DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Coaches can view payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;

-- Recreate with helper function
CREATE POLICY "Admins can manage groups" ON public.groups
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage members" ON public.members
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage lessons" ON public.lessons
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage attendance" ON public.attendance
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.is_admin(auth.uid()));

-- Create helper function for coach check (optional, but safer)
CREATE OR REPLACE FUNCTION public.is_coach(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'coach'
    );
END;
$$;

CREATE POLICY "Coaches can view payments" ON public.payments
    FOR SELECT USING (public.is_coach(auth.uid()));

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_coach(UUID) TO authenticated;

CREATE POLICY "Admins can manage inventory" ON public.inventory
    FOR ALL USING (public.is_admin(auth.uid()));

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- =============================================
-- IMPORTANT: Create Admin User
-- =============================================
-- After running this script, you need to:
-- 1. Create a user in Supabase Dashboard > Authentication > Users
-- 2. Then run this query to set their role to 'admin':
--
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'YOUR_USER_ID_HERE';
--
-- Or use this query to find your user and update:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

