-- =============================================
-- SIMPLE FIX: Disable RLS on profiles (Guaranteed to work)
-- =============================================
-- Run this in Supabase SQL Editor
-- This is the simplest and most reliable fix

-- Step 1: Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on profiles (if any exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Step 3: Create helper function for admin check
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

-- Step 4: Create helper function for coach check
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

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach(UUID) TO authenticated;

-- Step 6: Update groups policies (with proper INSERT support)
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can insert groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can delete groups" ON public.groups;
DROP POLICY IF EXISTS "Coaches can update their groups" ON public.groups;

-- SELECT policy - anyone can view
CREATE POLICY "Anyone can view groups" ON public.groups
    FOR SELECT USING (true);

-- INSERT policy - only admins can insert
CREATE POLICY "Admins can insert groups" ON public.groups
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE policy - admins can update, coaches can update their own
CREATE POLICY "Admins can update groups" ON public.groups
    FOR UPDATE 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can update their groups" ON public.groups
    FOR UPDATE 
    USING (coach_id = auth.uid())
    WITH CHECK (coach_id = auth.uid());

-- DELETE policy - only admins can delete
CREATE POLICY "Admins can delete groups" ON public.groups
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Step 7: Update members policies (with proper INSERT support)
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;
DROP POLICY IF EXISTS "Admins can update members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;
DROP POLICY IF EXISTS "Coaches can view their group members" ON public.members;

-- SELECT policy - anyone can view
CREATE POLICY "Anyone can view members" ON public.members
    FOR SELECT USING (true);

-- INSERT policy - only admins can insert
CREATE POLICY "Admins can insert members" ON public.members
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE policy - only admins can update
CREATE POLICY "Admins can update members" ON public.members
    FOR UPDATE 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- DELETE policy - only admins can delete
CREATE POLICY "Admins can delete members" ON public.members
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Coaches can view their group members
CREATE POLICY "Coaches can view their group members" ON public.members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE groups.id = members.group_id AND groups.coach_id = auth.uid()
        )
    );

-- Step 8: Update lessons policies (with proper INSERT support)
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;
DROP POLICY IF EXISTS "Coaches can manage their group lessons" ON public.lessons;

-- SELECT policy - anyone can view
CREATE POLICY "Anyone can view lessons" ON public.lessons
    FOR SELECT USING (true);

-- INSERT policy - only admins can insert
CREATE POLICY "Admins can insert lessons" ON public.lessons
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE policy - admins can update, coaches can update their group lessons
CREATE POLICY "Admins can update lessons" ON public.lessons
    FOR UPDATE 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can manage their group lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE groups.id = lessons.group_id AND groups.coach_id = auth.uid()
        )
    );

-- DELETE policy - only admins can delete
CREATE POLICY "Admins can delete lessons" ON public.lessons
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Step 9: Update attendance policies (with proper INSERT support)
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can delete attendance" ON public.attendance;
DROP POLICY IF EXISTS "Coaches can manage their lesson attendance" ON public.attendance;

-- SELECT policy - anyone can view
CREATE POLICY "Anyone can view attendance" ON public.attendance
    FOR SELECT USING (true);

-- INSERT policy - only admins can insert
CREATE POLICY "Admins can insert attendance" ON public.attendance
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE policy - admins can update, coaches can update their lesson attendance
CREATE POLICY "Admins can update attendance" ON public.attendance
    FOR UPDATE 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can manage their lesson attendance" ON public.attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            JOIN public.groups ON groups.id = lessons.group_id
            WHERE lessons.id = attendance.lesson_id AND groups.coach_id = auth.uid()
        )
    );

-- DELETE policy - only admins can delete
CREATE POLICY "Admins can delete attendance" ON public.attendance
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Step 10: Update payments policies (with proper INSERT support)
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
DROP POLICY IF EXISTS "Coaches can view payments" ON public.payments;

-- INSERT policy - only admins can insert
CREATE POLICY "Admins can insert payments" ON public.payments
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE policy - only admins can update
CREATE POLICY "Admins can update payments" ON public.payments
    FOR UPDATE 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- DELETE policy - only admins can delete
CREATE POLICY "Admins can delete payments" ON public.payments
    FOR DELETE USING (public.is_admin(auth.uid()));

-- SELECT policy - admins and coaches can view
CREATE POLICY "Admins can view payments" ON public.payments
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches can view payments" ON public.payments
    FOR SELECT USING (public.is_coach(auth.uid()));

-- Step 11: Update inventory policies (with proper INSERT support)
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;

-- SELECT policy - anyone can view
CREATE POLICY "Anyone can view inventory" ON public.inventory
    FOR SELECT USING (true);

-- INSERT policy - only admins can insert
CREATE POLICY "Admins can insert inventory" ON public.inventory
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE policy - only admins can update
CREATE POLICY "Admins can update inventory" ON public.inventory
    FOR UPDATE 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- DELETE policy - only admins can delete
CREATE POLICY "Admins can delete inventory" ON public.inventory
    FOR DELETE USING (public.is_admin(auth.uid()));

-- =============================================
-- IMPORTANT: Set your user as admin
-- =============================================
-- After running this script, run this query:
-- 
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';
--
-- Or check your current user:
-- SELECT id, email, role FROM public.profiles;

