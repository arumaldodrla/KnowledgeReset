from django.db import models
import uuid


class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tenants'
        managed = False  # Don't let Django manage the table schema
        
    def __str__(self):
        return self.name


class Application(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, db_column='tenant_id')
    name = models.CharField(max_length=255)
    url_doc_base = models.URLField(max_length=500)
    description = models.TextField(null=True, blank=True)
    crawl_freq_days = models.IntegerField(default=7)
    last_crawl_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'applications'
        managed = False
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name


class CrawlJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    app = models.ForeignKey(Application, on_delete=models.CASCADE, db_column='app_id', related_name='crawl_jobs')
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, db_column='tenant_id')
    status = models.CharField(max_length=50, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    stats = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'crawl_jobs'
        managed = False
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.app.name} - {self.status}"
    
    @property
    def pages_processed(self):
        if self.stats and 'pages_crawled' in self.stats:
            return self.stats['pages_crawled']
        return 0


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    app = models.ForeignKey(Application, on_delete=models.CASCADE, db_column='app_id')
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, db_column='tenant_id')
    url = models.URLField(max_length=1000)
    title = models.CharField(max_length=500)
    content = models.TextField()
    breadcrumbs = models.JSONField(null=True, blank=True)
    embedding = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'documents'
        managed = False
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title


class CrawlerSetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, db_column='tenant_id')
    setting_key = models.CharField(max_length=100)
    setting_value = models.TextField()
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crawler_settings'
        managed = False
        unique_together = [['tenant', 'setting_key']]
        
    def __str__(self):
        return f"{self.setting_key}: {self.setting_value}"
