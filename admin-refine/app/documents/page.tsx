"use client";

import { List, useTable, useSelect } from "@refinedev/antd";
import { Table, Select, Space } from "antd";

export default function DocumentsList() {
    const { tableProps, searchFormProps } = useTable({
        resource: "documents",
        pagination: {
            pageSize: 10,
        },
        filters: {
            initial: [],
        }
    });

    const { selectProps: appSelectProps } = useSelect({
        resource: "applications",
        optionLabel: "name",
        optionValue: "id",
    });

    return (
        <List>
            <Space style={{ marginBottom: 16 }}>
                <Select
                    {...appSelectProps}
                    style={{ width: 200 }}
                    placeholder="Filter by Application"
                    allowClear
                    onChange={(value) => {
                        searchFormProps.onFinish?.({
                            appId: value,
                        });
                    }}
                />
            </Space>
            <Table
                {...tableProps}
                rowKey="id"
                pagination={{
                    ...tableProps.pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    hideOnSinglePage: true,
                }}
            >
                <Table.Column dataIndex="title" title="Title" ellipsis />
                <Table.Column
                    dataIndex="sourceUrl"
                    title="URL"
                    ellipsis
                    render={(sourceUrl) => (
                        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                            {sourceUrl}
                        </a>
                    )}
                />
                <Table.Column
                    dataIndex="breadcrumbs"
                    title="Breadcrumbs"
                    render={(breadcrumbs) => {
                        if (!Array.isArray(breadcrumbs)) return "-";
                        return breadcrumbs.map((b: any) => b.text || b).join(" > ");
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
