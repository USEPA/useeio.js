/**
 * Contains some meta-data of an USEEIO model.
 */
export interface ModelInfo {

    /**
     * The unique ID of the USEEIO model that is used in the request paths for
     * the web API.
     */
    id: string;

    /**
     * A descriptive name of the model.
     */
    name: string;

    /**
     * The regional scope of the model.
     */
    location: string;

    /**
     * An optional model description.
     */
    description?: string;
}
