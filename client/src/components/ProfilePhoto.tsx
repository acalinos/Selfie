import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import type { HTMLAttributes } from "react";

type ProfilePhotoProps = HTMLAttributes<HTMLDivElement>;

export default function ProfilePhoto({ className }: ProfilePhotoProps) {
  const { user } = useAuth();

  return (
    <Avatar className={className}>
      <AvatarImage
        src={`${import.meta.env.VITE_BASE_URL}${user?.profilePic}`}
        alt="fp"
      />
      <AvatarFallback>
        {user?.name?.slice(0, 1)}
        {user?.surname?.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}
