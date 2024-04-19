import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
import { modelList } from './mock';
import { AdvancedDynamicTexture, Button, Line, Control, Grid, TextBlock } from 'babylonjs-gui';
export default class CreateScene {
    _canvas: HTMLCanvasElement | null;
    _scene: BABYLON.Scene;
    _engine: BABYLON.Engine;
    light: BABYLON.HemisphericLight;
    // light2: BABYLON.DirectionalLight;
    _camera: BABYLON.ArcRotateCamera;
    cabinet: BABYLON.MeshAssetTask;
    box2Mesh: BABYLON.MeshAssetTask;
    boxMesh: BABYLON.MeshAssetTask;
    bgground: BABYLON.Mesh;
    constructor(id: string) {
        BABYLON.Database.IDBStorageEnabled = true;
        BABYLON.Animation.AllowMatricesInterpolation = true;
        this._canvas = document.getElementById(id) as HTMLCanvasElement
        this._engine = new BABYLON.Engine(this._canvas)
        this._engine.enableOfflineSupport = false;
        this._scene = new BABYLON.Scene(this._engine)
        this._scene.clearColor = new BABYLON.Color4(0.1, 0.12, 0.13)
        //-13, 1, -5
        // this._camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 1, 0), this._scene);
        this._camera = new BABYLON.ArcRotateCamera("Camera", 1.6, 1.5, 0, new BABYLON.Vector3(1.5, 1.5, 3.5), this._scene);
        this._camera.attachControl(this._canvas, true)
        this._camera.panningDistanceLimit = 5
        this._camera.panningSensibility = 5000;
        // this._camera.inertialPanningX = 1
        this._camera.angularSensibilityX = 10000
        this._camera.angularSensibilityY = 10000
        this._camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
        this.setCameraLimt()
        this.light = new BABYLON.HemisphericLight(
            'light1',
            new BABYLON.Vector3(0, 1, 0),
            this._scene
        )
        this.light.intensity = 0.6
        this.light.diffuse = new BABYLON.Color3(1, 1, 1)
        this.light.groundColor = new BABYLON.Color3(1, 1, 1)
        this.bgground = BABYLON.MeshBuilder.CreateGround('bgground', { width: 400, height: 400 })
        const groundMat = new BABYLON.StandardMaterial("bgground")
        groundMat.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.4)
        const texture = new BABYLON.Texture("texture/bg.jpeg", this._scene)
        texture.uScale = 20
        texture.vScale = 20
        groundMat.diffuseTexture = texture
        this.bgground.material = groundMat
        this.bgground.setEnabled(false)
        const assentsManager = new BABYLON.AssetsManager(this._scene)
        this.boxMesh = assentsManager.addMeshTask('box', '', './mesh/', 'G1.gltf')
        this.box2Mesh = assentsManager.addMeshTask('box2', '', './mesh/', 'scene.glb')
        this.cabinet = assentsManager.addMeshTask('box3', '', './mesh/', 'cs.gltf')
        const borderBoxMaterial = new BABYLON.StandardMaterial("myMaterial", this._scene);
        const borderBox = BABYLON.MeshBuilder.CreateBox('border', { width: 0.58, height: 2.2, depth: 2.9 })
        borderBoxMaterial.alpha = 0
        borderBoxMaterial.diffuseColor = new BABYLON.Color3(0.21, 0.3, 0.4)
        borderBox.material = borderBoxMaterial
        this.box2Mesh.onSuccess = (mesh) => {
            mesh.loadedAnimationGroups[0].loopAnimation = false
            mesh.loadedAnimationGroups[0].stop()
            mesh.loadedAnimationGroups[0].reset()
            mesh.loadedMeshes[0].position = new BABYLON.Vector3(0, 0.01, 1)
            mesh.loadedMeshes[0].rotation = new BABYLON.Vector3(0, 1.6, 0)
            mesh.loadedMeshes[0].name = 'boxMesh'
            mesh.loadedMeshes[0].setEnabled(false)
        }

        this.boxMesh.onSuccess = (mesh) => {
            mesh.loadedMeshes[0].name = 'boxMesh'
            mesh.loadedMeshes[0].position = new BABYLON.Vector3(0, 0.01, 1)
            mesh.loadedMeshes[0].rotation = new BABYLON.Vector3(0, 1.6, 0)
            mesh.loadedMeshes[0].setEnabled(false)
        }
        this._scene.environmentTexture =
            BABYLON.CubeTexture.CreateFromPrefilteredData(
                'texture/environment.env',
                this._scene
            )
        this._scene.environmentIntensity = 0.8
        const pbr = new BABYLON.PBRMaterial('pbr', this._scene)
        pbr.bumpTexture = new BABYLON.Texture(
            'texture/test.jpg',
            this._scene
        )
        pbr.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.8)
        pbr.metallic = 0.9
        pbr.roughness = 0.2
        this._scene.onPointerDown = (evt, mesh) => {
            console.log(mesh.pickedMesh);
        }
        this.cabinet.onSuccess = (mesh => {
            //调试工具
            // this._scene.debugLayer.show({ showExplorer: false })
            // this._scene.debugLayer.select(pbr, 'CLEAR COAT')
            borderBox.parent = mesh.loadedMeshes[3]
            borderBox.position = new BABYLON.Vector3(0.3, 1.25, -1.45)
            mesh.loadedMeshes.forEach(e => {
                if (e.name === 'root_primitive0' || e.name === 'root_primitive3') {
                    e.material = pbr
                }
            })
            this.initModel(mesh)
        })
        assentsManager.load()

        //渲染场景
        this._engine.runRenderLoop(() => {
            this._scene.render()
        })
    }

    clicked(mesh: BABYLON.AbstractMesh, index: number) {
        this.bgground.setEnabled(true)
        this.bgground.position = new BABYLON.Vector3(20, 0, -32)
        this.bgground.rotation = new BABYLON.Vector3(-Math.PI / 2, Math.PI / 6, Math.PI / 2)
        this.resetCameraLimt()
        const { x: cameraX, y: cameraY, z: cameraZ } = this._camera.position
        const { x: meshX, y: meshY, z: meshZ } = mesh.position
        const editBtn = Button.CreateSimpleButton("but", '编辑货架物品');
        editBtn.width = "800px"
        editBtn.height = "120px";
        editBtn.color = "white";
        editBtn.fontSize = '34px'
        editBtn.fontWeight = 'bold'
        editBtn.cornerRadius = 120;
        editBtn.background = "rgba(0,0,0,0.5)";
        const exitBtn = Button.CreateSimpleButton("but", '退出');
        exitBtn.width = "800px"
        exitBtn.height = "120px";
        exitBtn.color = "white";
        exitBtn.fontSize = '34px'
        exitBtn.cornerRadius = 120;
        exitBtn.top = 200
        exitBtn.fontWeight = 'bold'
        exitBtn.background = "rgba(0,0,0,0.5)";
        editBtn.onPointerDownObservable.add(val => {
            if (val.buttonIndex !== 0) return
            this.edit(index)
        })
        exitBtn.onPointerDownObservable.add(val => {
            if (val.buttonIndex !== 0) return
            guiTexture.dispose()
            this.reset(1.5)
        })
        const grid = BABYLON.MeshBuilder.CreatePlane('grid', { width: 2, height: 2 })
        const guiTexture = AdvancedDynamicTexture.CreateForMesh(grid, 1024, 1024);
        grid.position = new BABYLON.Vector3(meshX - 1, meshY - 0.5, meshZ - 4.5)
        grid.rotation = new BABYLON.Vector3(0, 8.41, 0)
        const posAni = new BABYLON.Animation('animationClicked', 'position', 100, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
        const posKeys = [{ frame: 0, value: new BABYLON.Vector3(cameraX, cameraY, cameraZ) }, { frame: 100, value: new BABYLON.Vector3(meshX - 4.2, meshY - 0.7, meshZ) }]
        posAni.setKeys(posKeys)
        this._camera.animations.push(posAni)
        const animations = this._scene.beginAnimation(this._camera, 0, 100, false);
        animations.waitAsync().then(() => {
            guiTexture.addControl(editBtn)
            guiTexture.addControl(exitBtn)
            this.setCameraLimt(0.02)
        })
    }

    reset(speed?: number) {
        this.resetCameraLimt()
        const animations = this._scene.beginAnimation(this._camera, 100, 0, false, speed || 1);
        animations.waitAsync().then(() => {
            this._camera.setTarget(new BABYLON.Vector3(1.5, 1.5, 3.5))
            this._camera.beta = 1.5
            this._camera.alpha = 1.6
            this._camera.radius = 0
            this._scene.meshes.forEach(e => {
                if (e.name.includes('model') || e.name === 'boxMesh') {
                    e.setEnabled(false)
                } else {
                    e.setEnabled(true)
                }
            })
            this.initModel(this.cabinet)
            this.setCameraLimt()
        })
    }

    importMesh(_path: string, _name: string) {
        const glMaterial = new BABYLON.StandardMaterial(
            'myMaterial',
            this._scene
        )
        glMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.85, 0.9)
        const gl = new BABYLON.GlowLayer('glow', this._scene)
        gl.intensity = 0.8
        BABYLON.SceneLoader.ImportMesh('', _path, _name, this._scene, (mesh: BABYLON.AbstractMesh[]) => {
            mesh.forEach(e => {
                if (e.name === 'root_primitive15' || e.name === 'root_primitive10') {
                    e.material = glMaterial
                    gl.addIncludedOnlyMesh(e as BABYLON.Mesh)
                }
                // e.receiveShadows = true;
            })
        }, (loading) => {
            console.log(`加载进度:${(loading.loaded / loading.total * 100).toFixed(2)}%`);
        })
    }

    createTypeBtn(index: number, data: any) {
        const grid = BABYLON.MeshBuilder.CreatePlane('button_grid' + index, { width: 1.5, height: 1.5 })
        const clickedMaterial = new BABYLON.StandardMaterial("myMaterial", this._scene);
        clickedMaterial.alpha = 0.17
        clickedMaterial.diffuseColor = new BABYLON.Color3(0, 0.07, 1);
        const guiTexture = AdvancedDynamicTexture.CreateForMesh(grid, 1080, 1080);
        const button = Button.CreateSimpleButton("button", '查看');
        button.width = "100%"
        button.height = "100%";
        button.fontSize = '25px'
        button.background = "rgba(0, 0, 0,0.5)";
        button.thickness = 0;
        button.color = "rgb(255,255,255)"
        button.name = 'model' + index
        button.zIndex = 89892
        grid.rotation.y = Math.PI
        const bioGrid = new Grid("bioGrid");
        const text = new TextBlock('text')
        text.text = `描述：${data.des}`
        text.color = "#FFF"
        text.fontSize = '30px'
        text.textWrapping = true;
        text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        text.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        text.paddingLeft = 20
        text.paddingRight = 20
        text.wordSplittingFunction = (line) => {
            const stringList = []
            let str = ''
            for (const i of line) {
                if (str.length === 12) {
                    stringList.push(str)
                    str = ''
                }
                str += i
            }
            return stringList
        }
        const typeText = text.clone() as TextBlock
        const statusText = text.clone() as TextBlock
        statusText.text = `状态：${data.status ? '已满' : '未满'}`
        typeText.text = `类型：${data.type}`
        bioGrid.width = '400px'
        bioGrid.height = '500px'
        bioGrid.background = "rgba(10,10,10,0.5)";
        bioGrid.top = 200
        bioGrid.addRowDefinition(100, true)
        bioGrid.addRowDefinition(30, true)
        bioGrid.addRowDefinition(100)
        bioGrid.addRowDefinition(60, true)
        bioGrid.addControl(statusText, 1)
        bioGrid.addControl(text, 2)
        bioGrid.addControl(button, 3)
        bioGrid.addControl(typeText, 0)
        button.onPointerClickObservable.add((val, mesh) => {
            if (val.buttonIndex !== 0) return
            const parentPos = mesh.userInfo.pickInfo.pickedMesh.position
            this._scene.meshes.forEach(e => {
                if (e.name !== mesh.target.name) {
                    if (e.name.includes('model') && !e.name.includes('border') && e.position.x < parentPos.x + 4 && e.position.x > parentPos.x) {
                        e.material = clickedMaterial
                    } else {
                        e.setEnabled(false)
                    }
                } else {
                    const { _x, _y, _z } = JSON.parse(JSON.stringify(parentPos))
                    this._camera.target = new BABYLON.Vector3(_x + 4, _y - 1, _z - 5.4)
                }
            })
            this.clicked(mesh.userInfo.pickInfo.pickedMesh, index)
        })
        guiTexture.addControl(bioGrid)
        return grid
    }

    initModel(mesh: BABYLON.MeshAssetTask) {
        mesh.loadedMeshes[0].setEnabled(false)
        for (let i = 1; i <= modelList.length; i++) {
            let grid: BABYLON.Mesh
            if (!this._scene.getMeshByName('button_grid' + i)) {
                grid = this.createTypeBtn(i, modelList[i - 1])
            }
            mesh.loadedMeshes.forEach((e, index) => {
                e.name = 'cabinet'
                if (index > 0) {
                    e.setEnabled(true)
                    const copy = e.clone('model' + i, null) as BABYLON.AbstractMesh
                    copy.parent = null
                    copy.position.x = 5 - i
                    if (index === 1 && grid) {
                        grid.position = new BABYLON.Vector3(copy.position.x - 0.15, copy.position.y + 2, copy.position.z + 0.1)
                    }
                }
            })
        }
    }

    setCameraLimt(limt: number = 0.2) {
        //限制相机旋转角度
        this._camera.lowerBetaLimit = this._camera.beta - limt
        this._camera.lowerAlphaLimit = this._camera.alpha - limt
        this._camera.upperBetaLimit = this._camera.beta + limt;
        this._camera.upperAlphaLimit = this._camera.alpha + limt;
    }

    resetCameraLimt() {
        this._camera.lowerBetaLimit = null
        this._camera.lowerAlphaLimit = null
        this._camera.upperBetaLimit = null
        this._camera.upperAlphaLimit = null
    }

    edit(index: number) {
        this.bgground.setEnabled(true)
        this.bgground.position = new BABYLON.Vector3(-60, 0, -32)
        this.bgground.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 6, -Math.PI / 2.5)
        //    this.bgground.rotation = new BABYLON.Vector3(-Math.PI / 5, Math.PI / 6, Math.PI / 2)
        this.resetCameraLimt()
        const postProcess = AdvancedDynamicTexture.CreateFullscreenUI('ui');
        const outButton = Button.CreateSimpleButton("outButton", '退出');
        outButton.color = "white"
        outButton.left = '-48%'
        outButton.top = '-48%'
        outButton.width = '200px'
        outButton.height = '60px'
        outButton.cornerRadius = 12
        outButton.thickness = 0
        outButton.background = "rgba(0,0,0,0.8)"
        outButton.paddingLeft = '20px'
        outButton.paddingTop = '20px'
        const particleHelper = BABYLON.ParticleHelper.CreateDefault(new BABYLON.Vector3(this._camera.position.x - 3.5, this._camera.position.y - 1, this._camera.position.z))
        particleHelper.updateSpeed = 0.005
        particleHelper.color1 = new BABYLON.Color4(0.4, 0.8, 1.0, 1.0);
        particleHelper.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        particleHelper.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        particleHelper.emitRate = 500
        particleHelper.maxSize = 0.01
        particleHelper.minSize = 0.08
        // particleHelper.start();
        for (let i = 0; i < modelList[index].records.length; i++) {
            const line = new Line('line');
            line.lineWidth = 1;
            line.color = "rgba(100, 100, 100,0.5)";
            line.x2 = -300
            line.linkOffsetY = -80
            const ceckButton = Button.CreateSimpleButton("ceckButton", `型号：${modelList[index].records[i].name}  存放日期：${modelList[index].records[i].date}`);
            ceckButton.width = "500px"
            ceckButton.height = "36px";
            ceckButton.color = "rgb(255,255,255)";
            ceckButton.fontSize = '16px'
            ceckButton.zIndex = 1200
            ceckButton.cornerRadius = 12;
            ceckButton.thickness = 0
            ceckButton.background = "rgba(0, 0, 0,0.4)";
            ceckButton.top = -340 + i * 80
            ceckButton.left = 350 + (100 * Math.sin(i))
            postProcess.addControl(ceckButton);
            postProcess.addControl(line);
            postProcess.addControl(outButton)
            line.connectedControl = ceckButton;
            line.linkWithMesh(this.box2Mesh.loadedMeshes[0])
        }
        outButton.onPointerUpObservable.add(val => {
            if (val.buttonIndex !== 0) return
            postProcess.dispose()
            particleHelper.dispose()
            this.reset(10)
        })
        this.box2Mesh.loadedMeshes[0].rotation.y = 5.1
        this.boxMesh.loadedMeshes[0].rotation.x = -0.5
        this.boxMesh.loadedMeshes[0].rotation.y = this.box2Mesh.loadedMeshes[0].rotation.y
        this.box2Mesh.loadedMeshes[0].rotation.x = this.boxMesh.loadedMeshes[0].rotation.x
        this.box2Mesh.loadedMeshes[0].position = new BABYLON.Vector3(this._camera.position.x - 3.5, this._camera.position.y - 1, this._camera.position.z)
        this.boxMesh.loadedMeshes[0].position = new BABYLON.Vector3(this._camera.position.x - 3.5, this._camera.position.y - 1, this._camera.position.z)
        this.box2Mesh.loadedMeshes.forEach(e => {
            e.setEnabled(true)
        })
        this.boxMesh.loadedMeshes.forEach(e => {
            e.setEnabled(true)
        })
        // new BABYLON.Animation('animationClicked', 'target', 90, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
        this._camera.target = new BABYLON.Vector3(this._camera.position.x - 4.5, this._camera.position.y - 0.8, this._camera.position.z + 1)
        this.box2Mesh.loadedAnimationGroups[0].start()

        this.setCameraLimt(0.02)
    }
}