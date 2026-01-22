"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export default function ApplicationEdit() {
    const { formProps, saveButtonProps } = useForm({
        redirect: "list",
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
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
                    label="Crawl Frequency"
                    name="crawlFreqDays"
                    rules={[
                        {
                            required: true,
                            message: "Please select crawl frequency",
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: "Daily",
                                value: 1,
                            },
                            {
                                label: "Weekly",
                                value: 7,
                            },
                            {
                                label: "Bi-weekly",
                                value: 14,
                            },
                            {
                                label: "Monthly",
                                value: 30,
                            },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Edit>
    );
}
