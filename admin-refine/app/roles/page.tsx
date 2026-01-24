"use client";

import { List, useTable } from "@refinedev/antd";
import { Table, Tag } from "antd";

export default function RolesList() {
    const { tableProps } = useTable({
        resource: "roles",
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column dataIndex="description" title="Description" />
                <Table.Column
                    dataIndex="isSystem"
                    title="Type"
                    render={(value) => (
                        <Tag color={value ? "blue" : "green"}>
                            {value ? "System" : "Custom"}
                        </Tag>
                    )}
                />
            </Table>
        </List>
    );
}
