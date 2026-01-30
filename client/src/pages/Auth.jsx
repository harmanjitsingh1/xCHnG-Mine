import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Auth() {
  return (
    <div className="flex min-h-screen items-center justify-center relative px-4">
      <div className="flex flex-col w-full max-w-sm items-center justify-center space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-primary">xCHnG</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Vinimayah <br /> The Exchange of Things
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link to="/login" className="w-full">
            <Button
              className="w-full rounded-xl py-6 text-lg  cursor-pointer"
              size="lg"
            >
              Login
            </Button>
          </Link>
          <Link to="/register" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl py-6 text-lg  cursor-pointer"
            >
              User Registration
            </Button>
          </Link>
        </div>
        <footer className="absolute bottom-5">
          <Link
            to="/contact"
            className="text-center text-gray-800 underline cursor-pointer px-4 py-2"
          >
            Contact Us
          </Link>
        </footer>
      </div>
    </div>
  );
}
