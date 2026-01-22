"use client";

import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";

export default function DocumentsList() {
    const { tableProps } = useTable({
        resource: "documents",
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="title" title="Title" ellipsis />
                <Table.Column
                    dataIndex="url"
                    title="URL"
                    ellipsis
                    render={(url) => (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            {url}
                        </a>
                    )}
                />
                <Table.Column
                    dataIndex="breadcrumbs"
                    title="Breadcrumbs"
                    render={(breadcrumbs) => {
                        try {
                            const parsed = typeof breadcrumbs === "string" ? JSON.parse(breadcrumbs) : breadcrumbs;
                            return Array.isArray(parsed) ? parsed.join(" > ") : "-";
                        } catch {
                            return "-";
                        }
                    }}
                />
                <Table.Column
                    dataIndex="createdAt"
                    title="Created"
                    render={(value) => (value ? new Date(value).toLocaleString() : "-")}
                />
            </Table>
        </List>
    );
}
