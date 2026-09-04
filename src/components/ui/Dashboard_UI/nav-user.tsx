import { useNavigate } from "react-router-dom"
import { useAuth } from "@/components/hooks/use-auth"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Dashboard_UI/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dashboard_UI/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/Dashboard_UI/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { logOut } = useAuth()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#2B2B2B]"
            >

              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.name}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>

              <IconDotsVertical className="ml-auto size-4" />

            </SidebarMenuButton>

          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >

            <DropdownMenuLabel className="p-0 font-normal">

              <div className="flex items-center gap-2 px-2 py-2 text-sm">

                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 leading-tight">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>

              </div>

            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate("settings")}
                className="cursor-pointer"
              >
                <IconUserCircle />
                Account
              </DropdownMenuItem>

              {/* <DropdownMenuItem>
                <IconCreditCard />

                Billing
              </DropdownMenuItem> */}

              <DropdownMenuItem
                onClick={() => navigate("notifications")}
                className="cursor-pointer"
              >
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={async () => {
                await logOut()
                navigate("/", { replace: true })
              }}
              className="cursor-pointer hover:bg-red-500/10 hover:text-red-400"
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}