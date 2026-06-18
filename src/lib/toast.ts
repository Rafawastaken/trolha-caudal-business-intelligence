import { toast } from "sonner";
import { ApiError } from "./api";

// =============================================================================
// Toast helpers — wraps sonner with project-specific knowledge of how the BE
// serializes errors. Single source of truth for "show feedback to the user."
//
// Use these helpers, not toast.{success,error} directly, so that:
//   - Error messages are extracted consistently from ApiError shapes.
//   - Rich-content errors (ApplyPartialFailureError) get a description, not
//     just a flat title.
//   - Network errors get a sensible fallback instead of "[object Object]".
// =============================================================================

/**
 * BE shape for partial-failure responses (campaign Apply/Revert returning 502).
 * Mirrors `campaign.ApplyPartialFailureError` Go struct.
 */
type PartialFailureBody = {
  success_count: number;
  failures: Array<{
    item_id: string;
    stage: string;
    message: string;
  }>;
};

function isPartialFailure(body: unknown): body is PartialFailureBody {
  return (
    !!body &&
    typeof body === "object" &&
    "failures" in body &&
    Array.isArray((body as PartialFailureBody).failures)
  );
}

/**
 * notify — success toast. Plain title; optional description.
 */
export function notify(title: string, description?: string): void {
  toast.success(title, description ? { description } : undefined);
}

/**
 * notifyInfo — info toast for non-error feedback (e.g. "no changes to save").
 */
export function notifyInfo(title: string, description?: string): void {
  toast.info(title, description ? { description } : undefined);
}

/**
 * notifyWarning — yellow toast. Use when an action partially succeeded
 * (e.g. "campaign created but 2 items failed") — neither full success nor
 * a hard error.
 */
export function notifyWarning(title: string, description?: string): void {
  toast.warning(title, description ? { description } : undefined);
}

/**
 * notifyError — error toast with smart message extraction.
 *
 * Strategy (in order):
 *   1. ApplyPartialFailureError body → title with success/failure counts +
 *      description listing per-stage failures (truncated at 3 + "and N more")
 *   2. ApiError → title from .message (already extracted from `body.error`),
 *      no description
 *   3. Error → title from .message
 *   4. Anything else → fallback title
 *
 * The fallback param is shown when the error has no extractable message
 * (e.g. network error before fetch resolved).
 */
export function notifyError(err: unknown, fallback = "Algo correu mal"): void {
  // Partial failure (Apply / Revert rolled back due to per-item Sage errors)
  if (err instanceof ApiError && isPartialFailure(err.body)) {
    const body = err.body;
    const failures = body.failures;
    const summary = failures
      .slice(0, 3)
      .map((f) => `${f.item_id} (${f.stage}): ${f.message}`)
      .join("\n");
    const more =
      failures.length > 3 ? `\n…e mais ${failures.length - 3}` : "";
    toast.error(
      `Operação revertida — ${failures.length} erro${
        failures.length === 1 ? "" : "s"
      } em Sage`,
      {
        description: `${body.success_count} item${
          body.success_count === 1 ? "" : "s"
        } chegaram a aplicar antes do rollback.\n\n${summary}${more}`,
        duration: 10000,
      },
    );
    return;
  }

  // Standard ApiError or generic Error — message is already human-readable.
  if (err instanceof Error && err.message) {
    toast.error(err.message);
    return;
  }

  // Unknown / undefined — fallback only.
  toast.error(fallback);
}
