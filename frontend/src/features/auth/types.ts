export type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  keepMe?: boolean;
};

export interface AuthPageProps {
  initialMode?: "login" | "register";
  onSuccess?: () => void;
}

export interface GoogleAuthButtonProps {
  isPending: boolean;
  onSuccessHandler: (idToken: string) => void;
  onError: (msg: string) => void;
}
