export interface InputFieldProps {
  type?: string;
  placeholder?: string;
  name: string;
  label: string;
  disabled?: boolean;

  // New props for useState compatibility
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  useFormik?: boolean; // default true
  min?:string | number;
  max?:string | number;
}

export interface PasswordFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  hideError?: boolean; 
}

export interface HeaderProps {
  className?: string;
}


