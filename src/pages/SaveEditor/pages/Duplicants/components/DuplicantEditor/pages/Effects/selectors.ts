
import { EffectInstance } from "oni-save-parser";

import { createStructuredSelector } from "@/state/utils";
import { makeGetDuplicantEffects  } from "@/services/save-editor/duplicants/selectors";

import Props from "./props";

export interface StateProps {
    effects: EffectInstance[];
}

const mapStateToProps = () => createStructuredSelector<Props, StateProps>({
    effects: makeGetDuplicantEffects("duplicantID")
});
export default mapStateToProps;