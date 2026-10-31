import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chunkAt,wantedChunks,heightAt,hash} from './world.js';
test('coordenadas negativas pertencem ao chunk correto',()=>{assert.deepEqual(chunkAt(-.1,-12.1),[-1,-2]);});
test('streaming mantém janela limitada e acompanha exploração',()=>{const a=wantedChunks(0,0),b=wantedChunks(1200,-1200);assert.equal(a.length,25);assert.equal(new Set(b.map(String)).size,25);assert.ok(b.every(([x,z])=>Math.abs(x-100)<=2&&Math.abs(z+100)<=2));});
test('geração é reprodutível e finita nos limites',()=>{for(const x of [-1200,-12,0,12,1200]){assert.equal(heightAt(x,12),heightAt(x,12));assert.ok(Number.isFinite(heightAt(x,-x)));assert.ok(hash(x,12)>=0&&hash(x,12)<1);}});
