import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function PagesLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("zulu_jewels")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    redirect("/auth/login");
  }
  const email = decoded.email;

  if (email !== process.env.ADMIN_EMAIL) {
    redirect("/Pages");
  }

  return children;
}
