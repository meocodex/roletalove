-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Migrate existing roles from users table to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT auth_user_id, user_role::text::app_role
FROM public.users
WHERE auth_user_id IS NOT NULL AND user_role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Update existing RLS policies on users table to use has_role function
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;

CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = auth_user_id OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Super admins can manage all users"
ON public.users
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Remove user_role column from users table (keep for now to avoid breaking changes)
-- We'll remove it after updating the frontend code
-- ALTER TABLE public.users DROP COLUMN user_role;