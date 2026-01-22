"use client";

import { AuthPage } from "@refinedev/antd";

export default function Login() {
    return (
        <AuthPage
            type="login"
            providers={[
                {
                    name: "google",
                    label: "Sign in with Google",
                },
            ]}
            formProps={{
                initialValues: {
                    email: "",
                    password: "",
                },
            }}
        />
    );
}
