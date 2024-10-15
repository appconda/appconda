import { DebugLogger } from "../modules/log";


const config = require('../config');

import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";

import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { BaseService } from "../BaseService";


export default class TestMe extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.llm';
    }

    get displayName(): string {
        return 'LLM Service'
    }


    public a: string = 'sdfdsf';
 

    async init() {
        

    }


    getConfig() {
        return config;
    }
}


