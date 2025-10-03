import { Injectable } from '@angular/core';
import * as ort from 'onnxruntime-web';
import { TypedTensor } from 'onnxruntime-web';

@Injectable({
    providedIn: 'root',
})
export class DqnAiService {
    private session: ort.InferenceSession | null = null;

    async loadModel(modelUrl: string): Promise<void> {
        console.log('loadModel', modelUrl);
        // this.session = await ort.InferenceSession.create(modelUrl, {
        //     executionProviders: ['wasm'], // ou ['webgl'] pour accélérer
        // });
        // this.session = await ort.InferenceSession.create('/assets/models/dqn_model.onnx', {
        //     executionProviders: ['wasm'],
        //     graphOptimizationLevel: 'all',
        //     Spécifier où aller chercher les WASM
        //     wasmPaths: '/assets/onnxruntime/',
        // });
        console.log('✅ ONNX model loaded:', modelUrl);
    }

    async predict(inputState: number[]): Promise<number[]> {
        console.log('predict', inputState);
        if (!this.session) throw new Error('Model not loaded');

        // Convertir l'input en tensor [1, 42]
        const tensor: TypedTensor<'float32'> = new ort.Tensor('float32', Float32Array.from(inputState), [1, inputState.length]);

        // Faire une inférence
        const result: ort.InferenceSession.ReturnType = await this.session.run({ input: tensor });
        const output: Float32Array = result['output'].data as Float32Array;

        return Array.from(output); // renvoyer comme tableau JS
    }
}
