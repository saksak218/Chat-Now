import { SignupForm } from "@/components/signup-form"
import Logo from "@/components/shared/Logo"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="mb-6 md:mb-8 flex justify-center">
        <Logo size="md" />
      </div>
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
