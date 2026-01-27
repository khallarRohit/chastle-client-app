import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthTabs from "./_components/auth-tab";

export default async function LoginPage(){
    // const cookieStore = await cookies();
    // const sessionToken = cookieStore.get("chastle_sess");

    // if (sessionToken) {
    //     // redirect("/");
    // }

    return <AuthTabs />;
}