"use client";

import { AuthPage } from "@refinedev/antd";

export default function Login() {
    return (
        <AuthPage
            type="login"
            formProps={{
                initialValues: {
                    email: "admin@example.com",
                    password: "password",
                },
            }}
        />
    );
}
