-- =============================================
-- TenisERP Database Schema for Supabase
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'coach' CHECK (role IN ('admin', 'coach')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- GROUPS TABLE
-- =============================================
CREATE TABLE public.groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Anyone can view groups" ON public.groups
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage groups" ON public.groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Coaches can update their groups" ON public.groups
    FOR UPDATE USING (coach_id = auth.uid());

-- =============================================
-- MEMBERS TABLE
-- =============================================
CREATE TABLE public.members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    birthdate DATE,
    is_child BOOLEAN NOT NULL DEFAULT FALSE,
    parent_name TEXT,
    parent_phone TEXT,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Members policies
CREATE POLICY "Anyone can view members" ON public.members
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage members" ON public.members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Coaches can view their group members" ON public.members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE groups.id = members.group_id AND groups.coach_id = auth.uid()
        )
    );

-- =============================================
-- LESSONS TABLE
-- =============================================
CREATE TABLE public.lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons policies
CREATE POLICY "Anyone can view lessons" ON public.lessons
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Coaches can manage their group lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE groups.id = lessons.group_id AND groups.coach_id = auth.uid()
        )
    );

-- =============================================
-- ATTENDANCE TABLE
-- =============================================
CREATE TABLE public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(lesson_id, member_id)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Attendance policies
CREATE POLICY "Anyone can view attendance" ON public.attendance
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage attendance" ON public.attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Coaches can manage their lesson attendance" ON public.attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            JOIN public.groups ON groups.id = lessons.group_id
            WHERE lessons.id = attendance.lesson_id AND groups.coach_id = auth.uid()
        )
    );

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- Format: YYYY-MM
    amount DECIMAL(10, 2) NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(member_id, period)
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Coaches can view payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'coach'
        )
    );

-- =============================================
-- INVENTORY TABLE
-- =============================================
CREATE TABLE public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Inventory policies
CREATE POLICY "Anyone can view inventory" ON public.inventory
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage inventory" ON public.inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'coach')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_members_group_id ON public.members(group_id);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_lessons_group_id ON public.lessons(group_id);
CREATE INDEX idx_lessons_date ON public.lessons(date);
CREATE INDEX idx_attendance_lesson_id ON public.attendance(lesson_id);
CREATE INDEX idx_attendance_member_id ON public.attendance(member_id);
CREATE INDEX idx_payments_member_id ON public.payments(member_id);
CREATE INDEX idx_payments_period ON public.payments(period);
CREATE INDEX idx_payments_paid ON public.payments(paid);

-- =============================================
-- VIEWS
-- =============================================

-- View for member details with group info
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

