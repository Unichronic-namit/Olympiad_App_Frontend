import Link from "next/link";
import Button from "../ui/Button";

export default function Header() {
  return (
    <nav className="container mx-auto px-6 py-4">
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-white hover:text-gray-200 transition"
        >
          Olympiad Prep
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-white hover:text-gray-200 transition px-4 py-2"
          >
            Login
          </Link>
          <Button href="/signup" variant="secondary">
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}
