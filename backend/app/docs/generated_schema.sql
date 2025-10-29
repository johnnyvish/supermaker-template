CREATE SCHEMA IF NOT EXISTS "hr_management_system";

CREATE TABLE IF NOT EXISTS "hr_management_system"."applicants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "location" text,
  "resume_url" text,
  "linkedin_url" text,
  "website_url" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "applicants_location_idx"
  ON "hr_management_system"."applicants" ("location");

CREATE UNIQUE INDEX IF NOT EXISTS "applicants_email_uniq_idx"
  ON "hr_management_system"."applicants" ("email");

CREATE TABLE IF NOT EXISTS "hr_management_system"."jobs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "department" text,
  "location" text,
  "employment_type" text,
  "description" text,
  "status" text NOT NULL DEFAULT 'open',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "jobs_department_idx"
  ON "hr_management_system"."jobs" ("department");

CREATE INDEX IF NOT EXISTS "jobs_status_idx"
  ON "hr_management_system"."jobs" ("status");

CREATE INDEX IF NOT EXISTS "jobs_location_idx"
  ON "hr_management_system"."jobs" ("location");

CREATE TABLE IF NOT EXISTS "hr_management_system"."applications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "applicant_id" uuid NOT NULL,
  "job_id" uuid NOT NULL,
  "source" text,
  "stage" text NOT NULL DEFAULT 'applied',
  "status" text NOT NULL DEFAULT 'active',
  "rejected_reason" text,
  "applied_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'applications'
      AND tc.constraint_name = 'applications_fk_0'
  ) THEN
    ALTER TABLE "hr_management_system"."applications"
      ADD CONSTRAINT "applications_fk_0"
      FOREIGN KEY ("applicant_id") REFERENCES "hr_management_system"."applicants" ("id") ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'applications'
      AND tc.constraint_name = 'applications_fk_1'
  ) THEN
    ALTER TABLE "hr_management_system"."applications"
      ADD CONSTRAINT "applications_fk_1"
      FOREIGN KEY ("job_id") REFERENCES "hr_management_system"."jobs" ("id") ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "applications_applicant_id_idx"
  ON "hr_management_system"."applications" ("applicant_id");

CREATE INDEX IF NOT EXISTS "applications_job_id_idx"
  ON "hr_management_system"."applications" ("job_id");

CREATE INDEX IF NOT EXISTS "applications_stage_idx"
  ON "hr_management_system"."applications" ("stage");

CREATE INDEX IF NOT EXISTS "applications_status_idx"
  ON "hr_management_system"."applications" ("status");

CREATE TABLE IF NOT EXISTS "hr_management_system"."interviewers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "display_name" text,
  "department" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "interviewers_department_idx"
  ON "hr_management_system"."interviewers" ("department");

CREATE UNIQUE INDEX IF NOT EXISTS "interviewers_email_uniq_idx"
  ON "hr_management_system"."interviewers" ("email");

CREATE TABLE IF NOT EXISTS "hr_management_system"."interviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "application_id" uuid NOT NULL,
  "scheduled_at" timestamp with time zone NOT NULL,
  "duration_minutes" integer,
  "interview_type" text NOT NULL DEFAULT 'screen',
  "location" text,
  "status" text NOT NULL DEFAULT 'scheduled',
  "feedback" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'interviews'
      AND tc.constraint_name = 'interviews_fk_0'
  ) THEN
    ALTER TABLE "hr_management_system"."interviews"
      ADD CONSTRAINT "interviews_fk_0"
      FOREIGN KEY ("application_id") REFERENCES "hr_management_system"."applications" ("id") ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "interviews_application_id_idx"
  ON "hr_management_system"."interviews" ("application_id");

CREATE INDEX IF NOT EXISTS "interviews_status_idx"
  ON "hr_management_system"."interviews" ("status");

CREATE INDEX IF NOT EXISTS "interviews_scheduled_at_idx"
  ON "hr_management_system"."interviews" ("scheduled_at");

CREATE TABLE IF NOT EXISTS "hr_management_system"."interview_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "interview_id" uuid NOT NULL,
  "interviewer_id" uuid NOT NULL,
  "role" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'interview_participants'
      AND tc.constraint_name = 'interview_participants_fk_0'
  ) THEN
    ALTER TABLE "hr_management_system"."interview_participants"
      ADD CONSTRAINT "interview_participants_fk_0"
      FOREIGN KEY ("interview_id") REFERENCES "hr_management_system"."interviews" ("id") ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'interview_participants'
      AND tc.constraint_name = 'interview_participants_fk_1'
  ) THEN
    ALTER TABLE "hr_management_system"."interview_participants"
      ADD CONSTRAINT "interview_participants_fk_1"
      FOREIGN KEY ("interviewer_id") REFERENCES "hr_management_system"."interviewers" ("id") ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "interview_participants_interview_id_idx"
  ON "hr_management_system"."interview_participants" ("interview_id");

CREATE INDEX IF NOT EXISTS "interview_participants_interviewer_id_idx"
  ON "hr_management_system"."interview_participants" ("interviewer_id");

CREATE TABLE IF NOT EXISTS "hr_management_system"."notes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "application_id" uuid NOT NULL,
  "author_id" uuid,
  "content" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'notes'
      AND tc.constraint_name = 'notes_fk_0'
  ) THEN
    ALTER TABLE "hr_management_system"."notes"
      ADD CONSTRAINT "notes_fk_0"
      FOREIGN KEY ("application_id") REFERENCES "hr_management_system"."applications" ("id") ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'notes'
      AND tc.constraint_name = 'notes_fk_1'
  ) THEN
    ALTER TABLE "hr_management_system"."notes"
      ADD CONSTRAINT "notes_fk_1"
      FOREIGN KEY ("author_id") REFERENCES "hr_management_system"."interviewers" ("id") ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "notes_application_id_idx"
  ON "hr_management_system"."notes" ("application_id");

CREATE INDEX IF NOT EXISTS "notes_author_id_idx"
  ON "hr_management_system"."notes" ("author_id");

CREATE TABLE IF NOT EXISTS "hr_management_system"."offers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "application_id" uuid NOT NULL,
  "salary" numeric,
  "currency" text,
  "start_date" date,
  "status" text NOT NULL DEFAULT 'draft',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'offers'
      AND tc.constraint_name = 'offers_fk_0'
  ) THEN
    ALTER TABLE "hr_management_system"."offers"
      ADD CONSTRAINT "offers_fk_0"
      FOREIGN KEY ("application_id") REFERENCES "hr_management_system"."applications" ("id") ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "offers_application_id_idx"
  ON "hr_management_system"."offers" ("application_id");

CREATE INDEX IF NOT EXISTS "offers_status_idx"
  ON "hr_management_system"."offers" ("status");

CREATE TABLE IF NOT EXISTS "hr_management_system"."tags" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_uniq_idx"
  ON "hr_management_system"."tags" ("name");

CREATE TABLE IF NOT EXISTS "hr_management_system"."applicant_tags" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "applicant_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'applicant_tags'
      AND tc.constraint_name = 'applicant_tags_fk_0'
  ) THEN
    ALTER TABLE "hr_management_system"."applicant_tags"
      ADD CONSTRAINT "applicant_tags_fk_0"
      FOREIGN KEY ("applicant_id") REFERENCES "hr_management_system"."applicants" ("id") ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'hr_management_system'
      AND tc.table_name = 'applicant_tags'
      AND tc.constraint_name = 'applicant_tags_fk_1'
  ) THEN
    ALTER TABLE "hr_management_system"."applicant_tags"
      ADD CONSTRAINT "applicant_tags_fk_1"
      FOREIGN KEY ("tag_id") REFERENCES "hr_management_system"."tags" ("id") ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "applicant_tags_applicant_id_idx"
  ON "hr_management_system"."applicant_tags" ("applicant_id");

CREATE INDEX IF NOT EXISTS "applicant_tags_tag_id_idx"
  ON "hr_management_system"."applicant_tags" ("tag_id");

CREATE UNIQUE INDEX IF NOT EXISTS "applicant_tags_unique_idx"
  ON "hr_management_system"."applicant_tags" ("applicant_id", "tag_id");

CREATE TABLE IF NOT EXISTS "hr_management_system"."events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "payload" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "events_entity_type_idx"
  ON "hr_management_system"."events" ("entity_type");

CREATE INDEX IF NOT EXISTS "events_entity_id_idx"
  ON "hr_management_system"."events" ("entity_id");

CREATE INDEX IF NOT EXISTS "events_event_type_idx"
  ON "hr_management_system"."events" ("event_type");
