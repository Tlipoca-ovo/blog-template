import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FriendManager } from "./components/FriendManager";

export default async function FriendsPage() {
  const friends = await prisma.friendLink.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AdminHeader title="友链管理" description="管理博客友情链接" />
      <FriendManager initialFriends={friends} />
    </div>
  );
}