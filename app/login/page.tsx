import { Header } from "../../components/Header";
import { LoginPage } from "../../components/LoginPage";

export default function LoginRoute() {
  return (
    <>
      <Header active="login" />
      <LoginPage />
    </>
  );
}
