"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export default function UserCreate() {
    const { formProps, saveButtonProps } = useForm({
        resource: "users",
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Please enter a valid email" },
                    ]}
                >
                    <Input placeholder="user@example.com" />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        { required: true, message: "Password is required" },
                        { min: 8, message: "Password must be at least 8 characters" },
                    ]}
                    help="User will be able to change this password after first login"
                >
                    <Input.Password placeholder="Temporary password" />
                </Form.Item>
                <Form.Item
                    label="Full Name"
                    name="fullName"
                >
                    <Input placeholder="John Doe" />
                </Form.Item>
            </Form>
        </Create>
    );
}
