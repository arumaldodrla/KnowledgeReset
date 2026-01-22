"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export default function UserEdit() {
    const { formProps, saveButtonProps } = useForm({
        resource: "users",
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Please enter a valid email" },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Full Name"
                    name="fullName"
                >
                    <Input placeholder="John Doe" />
                </Form.Item>
            </Form>
        </Edit>
    );
}
