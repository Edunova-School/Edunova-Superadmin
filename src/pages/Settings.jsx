import React, { useState } from "react";
import { PageHeader, SectionCard, Field, TextInput, Button, Toggle } from "../components/ui.jsx";

export default function Settings() {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div>
      <PageHeader eyebrow="Account" title="Settings" description="Manage your own superadmin profile and security preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Profile" description="This information is visible to other admins in activity and audit logs.">
          <div className="flex flex-col gap-4">
            <Field label="Full name">
              <TextInput defaultValue="Superadmin Account" />
            </Field>
            <Field label="Email address" hint="Used for sign-in and security alerts.">
              <TextInput defaultValue="superadmin@edunova.edu.ng" type="email" />
            </Field>
            <div className="pt-2">
              <Button variant="primary">Save changes</Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Security" description="Protect the account with the highest privilege level on the platform.">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black">Two-factor authentication</p>
                <p className="text-xs text-black/40 mt-0.5">Require a one-time code at every sign-in.</p>
              </div>
              <Toggle checked={twoFactor} onChange={setTwoFactor} label="Two-factor authentication" />
            </div>
            <div className="pt-4 border-t border-black/[0.06]">
              <Field label="Current password">
                <TextInput type="password" placeholder="••••••••" />
              </Field>
            </div>
            <Field label="New password">
              <TextInput type="password" placeholder="••••••••" />
            </Field>
            <div className="pt-2">
              <Button variant="outline">Update password</Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
