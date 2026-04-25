import { Injectable } from "@nestjs/common";
import { LocalRuntimeService } from "../studio/local-runtime.service";

@Injectable()
export class RuntimeService {
  constructor(private readonly localRuntimeService: LocalRuntimeService) {}

  listLocalModels() {
    return this.localRuntimeService.listModelCatalog().then((models) =>
      models.map((model) => ({
        kind: model.inference_mode || model.category,
        label: model.label,
        localPath: model.model_id,
        ready: true,
      })),
    );
  }
}
