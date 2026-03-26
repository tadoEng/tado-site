// scripts/fix-wrangler.mjs
import { readFileSync, writeFileSync } from "node:fs";

const path = "./dist/server/wrangler.json";
const config = JSON.parse(readFileSync(path, "utf-8"));

// Remove Worker-only fields not allowed in Pages projects
delete config.main;
delete config.rules;
delete config.assets;
delete config.no_bundle;

// Fix: triggers must have crons array, not empty object
if (config.triggers && !Array.isArray(config.triggers.crons)) {
  config.triggers = { crons: [] };
}

// Fix: Remove SESSION kv binding with no id
if (config.kv_namespaces) {
  config.kv_namespaces = config.kv_namespaces.filter(
    (kv) => kv.binding !== "SESSION" || kv.id
  );
  if (config.kv_namespaces.length === 0) {
    delete config.kv_namespaces;
  }
}

// Remove fields Pages wrangler doesn't understand
delete config.definedEnvironments;
delete config.secrets_store_secrets;
delete config.unsafe_hello_world;
delete config.worker_loaders;
delete config.ratelimits;
delete config.vpc_services;
delete config.python_modules;
delete config.cloudchamber;
delete config.send_email;
delete config.workflows;
delete config.migrations;
delete config.vectorize;
delete config.hyperdrive;
delete config.dispatch_namespaces;
delete config.mtls_certificates;
delete config.pipelines;
delete config.logfwdr;
delete config.durable_objects;
delete config.legacy_env;
delete config.jsx_factory;
delete config.jsx_fragment;
delete config.userConfigPath;
delete config.configPath;
delete config.definedEnvironments;
if (config.dev) {
  delete config.dev.enable_containers;
  delete config.dev.generate_types;
}

writeFileSync(path, JSON.stringify(config, null, 2));
console.log("✓ Patched dist/server/wrangler.json for Cloudflare Pages compatibility");