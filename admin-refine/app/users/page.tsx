"use client";

import { List, useTable, EditButton, DeleteButton, CreateButton } from "@refinedev/antd";
import { Table, Space } from "antd";

export default function UsersList() {
    const { tableProps } = useTable({
        resource: "users",
    });

    return (
        <List
            headerButtons={({ defaultButtons }) => (
                <>
                    {defaultButtons}
                    <CreateButton>Invite User</CreateButton>
                </>
            )}
        >
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="email" title="Email" />
                <Table.Column
                    dataIndex="createdAt"
                    title="Created"
                    render={(value) => (value ? new Date(value).toLocaleDateString() : "-")}
                />
                <Table.Column
                    dataIndex="lastSignInAt"
                    title="Last Sign In"
                    render={(value) => (value ? new Date(value).toLocaleString() : "Never")}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: any) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
