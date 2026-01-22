"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export default function ApplicationCreate() {
    const { formProps, saveButtonProps } = useForm({
        redirect: "list",
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="URL Doc Base"
                    name="urlDocBase"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input.TextArea rows={5} />
                </Form.Item>
                <Form.Item
                    label="Status"
                    name="status"
                    initialValue="pending"
                >
                    <Select
                        options={[
                            {
                                label: "Pending",
                                value: "pending",
                            },
                            {
                                label: "Processing",
                                value: "processing",
                            },
                            {
                                label: "Completed",
                                value: "completed",
                            },
                            {
                                label: "Failed",
                                value: "failed",
                            },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Create>
    );
}
