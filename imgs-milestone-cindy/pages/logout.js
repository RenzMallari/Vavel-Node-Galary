import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logout } from "../redux/actions/auth";

function Logout() {
  const router = useRouter();
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(logout());
    router.push("/");
  }, []);

  return null;
}

export default Logout;
