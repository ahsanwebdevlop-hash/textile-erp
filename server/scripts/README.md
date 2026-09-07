# Legacy Data Migration

The migration script is dry-run by default. It never assigns a legacy record based on `createdBy`, email, company name, or any other guess.

Create an approved JSON mapping using this shape:

```json
{
  "inventory": {
    "LEGACY_RECORD_ID": "APPROVED_ORGANIZATION_ID"
  },
  "users": {
    "LEGACY_USER_ID": "APPROVED_ORGANIZATION_ID"
  }
}
```

Run an inspection report without changing MongoDB:

```text
npm run migrate:legacy-data
```

Apply only the explicit mappings and quarantine unmapped records:

```text
npm run migrate:legacy-data -- --map=./scripts/legacy-organization-map.json --apply
```

The script validates every organization ID, records unmapped records in `migration_quarantine`, and synchronizes organization-scoped indexes only in apply mode. Review the dry-run report and approve the mapping before using `--apply`.