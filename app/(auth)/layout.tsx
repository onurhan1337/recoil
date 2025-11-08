import { withRSCTrace } from "quzz";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withRSCTrace(AuthLayout, {
  componentName: "AuthLayout",
  logProps: false,
});
