import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { ProfilePage } from "../../components/ProfilePage";

export default function ProfileRoute() {
  return (
    <>
      <Header active="profile" />
      <ProfilePage />
      <Footer />
    </>
  );
}
