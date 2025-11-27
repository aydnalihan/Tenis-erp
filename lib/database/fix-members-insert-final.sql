-- =============================================
-- FINAL FIX: Members Table INSERT Policy
-- =============================================
-- This is a more aggressive fix that should definitely work
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing members policies
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;
DROP POLICY IF EXISTS "Admins can update members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;
DROP POLICY IF EXISTS "Coaches can view their group members" ON public.members;

-- Step 2: Verify is_admin function exists and works
-- If this fails, the function needs to be created first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'is_admin'
    ) THEN
        RAISE EXCEPTION 'is_admin function does not exist! Run fix-rls-simple.sql first.';
    END IF;
END $$;

-- Step 3: Create policies with explicit permissions
-- SELECT - anyone can view
CREATE POLICY "Anyone can view members" ON public.members
    FOR SELECT 
    USING (true);

-- INSERT - admins can insert (WITH CHECK is required for INSERT)
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

-- Step 4: Verify policies were created
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'members'
ORDER BY policyname;

-- Step 5: Test current user
SELECT 
    auth.uid() as user_id,
    public.is_admin(auth.uid()) as is_admin,
    (SELECT role FROM public.profiles WHERE id = auth.uid()) as user_role;

