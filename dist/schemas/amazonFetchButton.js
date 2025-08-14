import { defineType } from 'sanity';
import { AmazonFetchButton } from '../inputs/AmazonFetchButton';
export const amazonFetchButtonSchema = defineType({
    name: 'amazonFetchButton',
    title: 'Amazon Fetch Button',
    type: 'string',
    readOnly: true,
    components: {
        input: AmazonFetchButton,
    },
});
