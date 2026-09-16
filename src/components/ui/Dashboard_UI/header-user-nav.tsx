import { useNavigate } from "react-router-dom"
import { useAuth } from "@/components/hooks/use-auth"
import { useResolvedAvatar } from "@/components/hooks/use-resolved-avatar"
import {
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconSettings,
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
import { useNotifications } from "@/components/hooks/use-notifications"

export function HeaderUserNav() {
  const navigate = useNavigate()
  const { user, logOut } = useAuth()
  const avatar = useResolvedAvatar()
  const { unreadCount } = useNotifications(user?.uid ?? "")

  const name = user?.displayName || "User"
  const email = user?.email || ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-[#D2F832] focus:ring-offset-1 hover:opacity-95 transition-all p-0.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1320] shadow-2xs cursor-pointer">
          <div className="rounded-full overflow-hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs">{name[0]}</AvatarFallback>
            </Avatar>
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white dark:border-[#070A11] shadow-2xs"></span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F15]/95 backdrop-blur-md"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar} />
              <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5 leading-tight overflow-hidden">
              <span className="font-semibold truncate">{name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem
            onClick={() => navigate("notifications")}
            className="cursor-pointer gap-2 rounded-md py-2 justify-between"
          >
            <div className="flex items-center gap-2">
              <IconNotification className="size-4 text-muted-foreground" />
              <span className="text-sm">Notification Center</span>
            </div>
            {unreadCount > 0 && (
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate("settings")}
            className="cursor-pointer gap-2 rounded-md py-2"
          >
            <IconSettings className="size-4 text-muted-foreground" />
            <span className="text-sm">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <div className="p-1">
          <DropdownMenuItem
            onClick={async () => {
              await logOut()
              navigate("/", { replace: true })
            }}
            className="cursor-pointer gap-2 rounded-md py-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30"
          >
            <IconLogout className="size-4" />
            <span className="text-sm font-medium">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
