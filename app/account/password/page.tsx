import { ChangePasswordForm } from "./ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-[440px]">
      <h1 className="text-[28px]">Change password</h1>
      <p className="mb-6 mt-1 text-[15px] text-muted">
        Set a new password for your account.
      </p>
      <div className="card">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
