import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Page_Not_Found/empty";
import { HomeIcon, LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { auth } from "@/firebase/firebase";

export function NotFound() {
	const user = auth.currentUser;

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			<Empty>
				<EmptyHeader>
					<EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl">
						404
					</EmptyTitle>

					<EmptyDescription className="-mt-8 text-foreground/80 text-center">
						The page you're looking for might have been <br />
						moved or doesn't exist.
					</EmptyDescription>
				</EmptyHeader>

				<EmptyContent>
					<div className="flex gap-3">

						{/* Home */}
						<Button asChild>
							<Link to="/">
								<HomeIcon className="size-4 mr-2" />
								Go Home
							</Link>
						</Button>

						{/* Dashboard (only if logged in) */}
						{user && (
							<Button variant="secondary" asChild>
								<Link to="/dashboard">
									<LayoutDashboardIcon className="size-4 mr-2" />
									Go to Dashboard
								</Link>
							</Button>
						)}

					</div>
				</EmptyContent>
			</Empty>
		</div>
	);
}