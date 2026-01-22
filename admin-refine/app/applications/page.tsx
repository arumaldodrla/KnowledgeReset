"use client";

import { useList, useCustomMutation } from "@refinedev/core";
import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Button, message } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { gql } from "graphql-request";

const START_CRAWL = gql`
  mutation StartCrawl($appId: ID!, $url: String!, $maxDepth: Int!, $maxPages: Int!) {
    startCrawl(appId: $appId, url: $url, maxDepth: $maxDepth, maxPages: $maxPages) {
      success
      message
    }
  }
`;

export default function ApplicationList() {
    const { tableProps } = useTable({
        resource: "applications",
    });

    const { mutate: startCrawl, isLoading } = useCustomMutation();

    const handleStartCrawl = async (record: any) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: START_CRAWL,
                    variables: {
                        appId: record.id,
                        url: record.urlDocBase,
                        maxDepth: 50,
                        maxPages: 100,
                    },
                }),
            });

            const result = await response.json();

            if (result.data?.startCrawl?.success) {
                message.success("Crawl started successfully!");
            } else {
                message.error(result.data?.startCrawl?.message || "Failed to start crawl");
            }
        } catch (error: any) {
            message.error(`Error: ${error.message}`);
        }
    };

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column dataIndex="urlDocBase" title="URL" />
                <Table.Column dataIndex="status" title="Status" />
                <Table.Column
                    dataIndex="lastCrawlAt"
                    title="Last Crawled"
                    render={(value) => (value ? new Date(value).toLocaleString() : "Never")}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: any) => (
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={() => handleStartCrawl(record)}
                                loading={isLoading}
                                size="small"
                            >
                                Start Crawl
                            </Button>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
