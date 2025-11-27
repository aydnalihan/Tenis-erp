-- =============================================
-- FIX: Members Table INSERT Policy
-- =============================================
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing members policies
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Coaches can view their group members" ON public.members;

-- Step 2: Recreate policies with proper WITH CHECK clause for INSERT
-- SELECT policy - anyone can view
CREATE POLICY "Anyone can view members" ON public.members
    FOR SELECT 
    USING (true);

-- INSERT policy - only admins can insert
CREATE POLICY "Admins can insert members" ON public.members
    FOR INSERT 
    WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE policy - only admins can update
CREATE POLICY "Admins can update members" ON public.members
    FOR UPDATE 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- DELETE policy - only admins can delete
CREATE POLICY "Admins can delete members" ON public.members
    FOR DELETE 
    USING (public.is_admin(auth.uid()));

-- Coaches can view their group members (SELECT only)
CREATE POLICY "Coaches can view their group members" ON public.members
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE groups.id = members.group_id AND groups.coach_id = auth.uid()
        )
    );

-- =============================================
-- Verify the policies
-- =============================================
-- Run this to check:
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'members';

