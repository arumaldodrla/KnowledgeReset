"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export default function UserEdit() {
    const { formProps, saveButtonProps, query: queryResult, onFinish } = useForm({
        resource: "users",
        meta: {
            // Include role info when fetching user
            fields: ["id", "email", "fullName", "role { id name }"]
        }
    });

    const { selectProps: roleSelectProps } = useSelect({
        resource: "roles",
        optionLabel: "name",
        optionValue: "id",
    });

    // Custom join logic for role assignment since it's a separate mutation
    const handleFinish = async (values: any) => {
        const { roleId, ...rest } = values;

        // Fix: Refine useForm onFinish handles standard resource update
        // We'll let Refine update the user metadata, then we call our custom role mutation
        await onFinish(rest);

        if (roleId) {
            const userData = (queryResult as any)?.data?.data;
            const userId = userData?.id;

            if (userId) {
                const { dataProvider } = await import("../../../providers/data-provider");
                await dataProvider.custom!({
                    url: "",
                    method: "post",
                    payload: {
                        query: `
                            mutation AssignRole($userId: ID!, $roleId: ID!) {
                                assignRole(userId: $userId, roleId: $roleId) {
                                    id
                                }
                            }
                        `,
                        variables: { userId, roleId }
                    }
                });
            }
        }
    };

    const userData = (queryResult as any)?.data?.data;
    const initialRoleId = userData?.role?.id;

    return (
        <Edit saveButtonProps={{
            ...saveButtonProps, onClick: (e) => {
                // Intercept form submission to use our custom handler
                formProps.form?.validateFields().then(handleFinish);
            }
        }}>
            <Form
                {...formProps}
                layout="vertical"
                initialValues={{
                    ...formProps.initialValues,
                    roleId: initialRoleId
                }}
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Please enter a valid email" },
                    ]}
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label="Full Name"
                    name="fullName"
                >
                    <Input placeholder="John Doe" />
                </Form.Item>
                <Form.Item
                    label="Role"
                    name="roleId"
                    rules={[{ required: true, message: "Role is required" }]}
                >
                    <Select {...(roleSelectProps as any)} placeholder="Select a role" />
                </Form.Item>
            </Form>
        </Edit>
    );
}
